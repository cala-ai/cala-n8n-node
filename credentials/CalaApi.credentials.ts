import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CalaApi implements ICredentialType {
	name = 'calaApi';
	displayName = 'Cala API';
	documentationUrl = 'https://docs.cala.ai';
	icon = { light: 'file:cala.svg', dark: 'file:cala.dark.svg' } as const;
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Cala API key.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.cala.ai',
			url: '/v1/entities',
			method: 'GET',
			qs: {
				name: 'test',
			},
		},
	};
}
