import {
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
}
