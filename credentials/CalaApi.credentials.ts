import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CalaApi implements ICredentialType {
	name = 'calaApi';
	displayName = 'Cala API';
	documentationUrl = 'https://docs.cala.ai';
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
			description: 'Your Cala API key',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.cala.ai',
			url: '/v1/knowledge/search',
			method: 'POST',
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
			body: {
				input: 'test',
			},
		},
	};
}
