import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class Cala implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cala',
		name: 'cala',
		icon: 'file:cala.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Search verified knowledge with Cala AI',
		defaults: {
			name: 'Cala',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'calaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Knowledge Search',
						value: 'knowledgeSearch',
						description: 'Search verified knowledge',
						action: 'Search verified knowledge',
					},
				],
				default: 'knowledgeSearch',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['knowledgeSearch'],
					},
				},
				default: '',
				placeholder: 'What is the refund policy?',
				description: 'The search query to find verified knowledge',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('calaApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		const apiKey = credentials.apiKey as string | undefined;

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			if (operation === 'knowledgeSearch') {
				const query = this.getNodeParameter('query', i) as string;

				const headers: Record<string, string> = {
					'Content-Type': 'application/json',
				};

				if (apiKey) {
					headers['X-API-KEY'] = apiKey;
				}

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/v1/knowledge/search`,
					headers,
					body: {
						input: query,
					},
					json: true,
				});

				returnData.push({
					json: response,
					pairedItem: { item: i },
				});
			}
		}

		return [returnData];
	}
}
