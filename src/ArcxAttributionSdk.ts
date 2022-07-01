import {cast, asString} from '@restless/sanitizers'

type Attributes = Record<string, string | number | Record<string, string | number>>

type SdkConfig = {
	trackPages: boolean,
}

export class ArcxAttributionSdk {
	private constructor(
		public readonly apiKey: string,
		public readonly identityId: string,
		private readonly arcxUrl: string,
		private readonly sdkConfig: SdkConfig,
	) {
		if (this.sdkConfig.trackPages) {
			document.body.addEventListener('click', ()=>{
				requestAnimationFrame(()=>{
					if((window as any).url!==location.href){
						(window as any).url = location.href
						this.page({url: (window as any).url})
					}
				});
		}, true);
		}
	}

	static async identify(apiKey: string, sdkConfig: SdkConfig = { trackPages: true }, arcxUrl: string = 'https://api.arcx.money/v1') : Promise<ArcxAttributionSdk> {
		const identityId =  await this.postAnalytics(arcxUrl, apiKey, '/identify') 
		return new ArcxAttributionSdk(apiKey, identityId, arcxUrl, sdkConfig)
	}

	async event (event: string, attributes?: Attributes) {
		return ArcxAttributionSdk.postAnalytics(this.arcxUrl, this.apiKey, '/submit-event', {
			identityId: this.identityId,
			event,
			attributes: { ...attributes },
		})
	}

	page (attributes: {url: string}) {
		return this.event('PAGE', attributes)
	}

	connectWallet(attributes: {account: string, chain: string | number}) {
		return this.event('CONNECT', attributes)
	}

	async transaction(transactionType: string, transactionHash?: string, attributes?: Attributes) {
		const _attributes: Attributes = {
			type: transactionType,
			...attributes
		}
		if (transactionHash) {
			_attributes.transaction_hash = transactionHash
		}
		return this.event('TRANSACTION_SUBMITTED', _attributes)
	}

	static async postAnalytics (arcxUrl: string, apiKey: string, path: string, data?: any) {
		const response = await fetch(`${arcxUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				'x-api-key': apiKey,
			},
			body: JSON.stringify(data),
		})
		const body = await response.json()
		return cast(body, asString)
	}
}