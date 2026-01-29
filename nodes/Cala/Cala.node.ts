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
		subtitle: 'Knowledge Search',
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
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				default: '',
				placeholder: "i.e. What were Toyota's total sales in 2023?",
				description: 'The search query to find knowledge',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('calaApi');
		const apiKey = credentials.apiKey as string | undefined;

		for (let i = 0; i < items.length; i++) {
			const query = this.getNodeParameter('query', i) as string;

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};

			if (apiKey) {
				headers['X-API-KEY'] = apiKey;
			}

			const response = await this.helpers.httpRequest({
				method: 'POST',
				url: 'https://api.cala.ai/v1/knowledge/search',
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

		return [returnData];
	}
}
