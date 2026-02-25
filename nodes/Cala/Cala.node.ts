import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

const BASE_URL = 'https://api.cala.ai';

export class Cala implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cala',
		name: 'cala',
		icon: 'file:cala.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Search trusted knowledge with Cala AI',
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
			// ── Resource ────────────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Knowledge',
						value: 'knowledge',
					},
				],
				default: 'knowledge',
			},

			// ── Operations ──────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['knowledge'] },
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						action: 'Search knowledge',
						description:
							'Answer natural language questions with sourced, researched content',
					},
					{
						name: 'Query',
						value: 'query',
						action: 'Query knowledge',
						description:
							'Filter entities by attributes using structured dot-notation syntax',
					},
					{
						name: 'Search Entities',
						value: 'searchEntities',
						action: 'Search entities',
						description: 'Find entities by name with fuzzy matching',
					},
					{
						name: 'Get Entity',
						value: 'getEntity',
						action: 'Get an entity',
						description: 'Get the full profile of an entity by its numeric ID',
					},
				],
				default: 'search',
			},

			// ── Knowledge › Search ──────────────────────────────────────────────
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				default: '',
				placeholder: "e.g. What were Toyota's total sales in 2023?",
				description: 'Natural language question to search knowledge for',
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['search'] },
				},
			},

			// ── Knowledge › Query ───────────────────────────────────────────────
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. startups.location=Spain.funding>10M',
				description:
					'Structured dot-notation query to filter entities by attributes',
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['query'] },
				},
			},

			// ── Knowledge › Search Entities ─────────────────────────────────────
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. OpenAI',
				description: 'Entity name to search for (supports fuzzy matching)',
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['searchEntities'] },
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 20,
				description: 'Maximum number of results to return',
				typeOptions: { minValue: 1, maxValue: 100 },
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['searchEntities'] },
				},
			},

			// ── Knowledge › Get Entity ──────────────────────────────────────────
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'number',
				required: true,
				default: 0,
				description: 'The numeric ID of the entity to retrieve',
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['getEntity'] },
				},
			},

			// ── Custom API Call ─────────────────────────────────────────────────
			{
				displayName: 'HTTP Method',
				name: 'method',
				type: 'options',
				options: [
					{ name: 'DELETE', value: 'DELETE' },
					{ name: 'GET', value: 'GET' },
					{ name: 'PATCH', value: 'PATCH' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
				],
				default: 'GET',
				displayOptions: {
					show: { operation: ['__CUSTOM_API_CALL__'] },
				},
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: '/v1/knowledge/search',
				description: 'API path relative to https://api.cala.ai',
				displayOptions: {
					show: { operation: ['__CUSTOM_API_CALL__'] },
				},
			},
			{
				displayName: 'Query Parameters',
				name: 'qs',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{ displayName: 'Name', name: 'name', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
					},
				],
				displayOptions: {
					show: { operation: ['__CUSTOM_API_CALL__'] },
				},
			},
			{
				displayName: 'Request Body',
				name: 'body',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						operation: ['__CUSTOM_API_CALL__'],
						method: ['POST', 'PUT', 'PATCH'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('calaApi');
		const apiKey = credentials.apiKey as string | undefined;

		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (apiKey) {
			headers['X-API-KEY'] = apiKey;
		}

		const resource = this.getNodeParameter('resource', 0) as string;

		if (resource === '__CUSTOM_API_CALL__') {
			throw new NodeOperationError(
				this.getNode(),
				'To make a custom API call, use the HTTP Request node and select the Cala API credential.',
			);
		}

		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			let response: unknown;

			if (operation === '__CUSTOM_API_CALL__') {
				const method = this.getNodeParameter('method', i) as IHttpRequestMethods;
				const url = this.getNodeParameter('url', i) as string;
				const qsParams = (this.getNodeParameter('qs.parameter', i, []) as Array<{ name: string; value: string }>);
				const qs = Object.fromEntries(qsParams.map(({ name, value }) => [name, value]));

				const requestOptions = {
					method,
					url: `${BASE_URL}${url}`,
					headers,
					json: true,
					...(Object.keys(qs).length > 0 && { qs }),
					...(['POST', 'PUT', 'PATCH'].includes(method) && {
						body: JSON.parse(this.getNodeParameter('body', i, '{}') as string),
					}),
				};

				response = await this.helpers.httpRequest(requestOptions);
			} else if (resource === 'knowledge') {
				if (operation === 'search') {
					const query = this.getNodeParameter('query', i) as string;
					response = await this.helpers.httpRequest({
						method: 'POST',
						url: `${BASE_URL}/v1/knowledge/search`,
						headers,
						body: { input: query },
						json: true,
					});
				} else if (operation === 'query') {
					const query = this.getNodeParameter('query', i) as string;
					response = await this.helpers.httpRequest({
						method: 'POST',
						url: `${BASE_URL}/v1/knowledge/query`,
						headers,
						body: { input: query },
						json: true,
					});
				} else if (operation === 'searchEntities') {
					const name = this.getNodeParameter('name', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${BASE_URL}/v1/knowledge/entities`,
						headers,
						qs: { name, limit },
						json: true,
					});
				} else if (operation === 'getEntity') {
					const entityId = this.getNodeParameter('entityId', i) as number;
					response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${BASE_URL}/v1/knowledge/entities/${entityId}`,
						headers,
						json: true,
					});
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
					);
				}
			} else {
				throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
			}

			returnData.push({
				json: response as IDataObject,
				pairedItem: { item: i },
			});
		}

		return [returnData];
	}
}
