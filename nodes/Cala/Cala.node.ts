import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeConnectionTypes,
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
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Search trusted knowledge with Cala AI.',
		defaults: {
			name: 'Cala',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
						name: 'Get Entity',
						value: 'getEntity',
						action: 'Get knowledge entity',
						description: 'Get the full profile of an entity by its numeric ID.',
					},
					{
						name: 'Query',
						value: 'query',
						action: 'Query knowledge',
						description: 'Filter entities by attributes using structured dot-notation syntax.',
					},
					{
						name: 'Search',
						value: 'search',
						action: 'Search knowledge',
						description: 'Answer natural language questions with sourced, researched content.',
					},
					{
						name: 'Search Entities',
						value: 'searchEntities',
						action: 'Search knowledge entities',
						description: 'Find entities by name with fuzzy matching.',
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
				description: 'Natural language question to search knowledge for.',
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
				description: 'Structured dot-notation query to filter entities by attributes.',
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
				description: 'Entity name to search for (supports fuzzy matching).',
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['searchEntities'] },
				},
			},
			{
				displayName: 'Entity Types',
				name: 'entity_types',
				type: 'multiOptions',
				default: [],
				description: 'Filter results by entity type. Leave empty to return all types.',
				options: [
					{ name: 'Company', value: 'Company' },
					{ name: 'Corporate Event', value: 'CorporateEvent' },
					{ name: 'Country', value: 'Country' },
					{ name: 'Country Region', value: 'CountryRegion' },
					{ name: 'Educational Institution', value: 'EducationalInstitution' },
					{ name: 'Entity', value: 'Entity' },
					{ name: 'Facility', value: 'Facility' },
					{ name: 'Financial Metric', value: 'FinancialMetric' },
					{ name: 'GPE', value: 'GPE' },
					{ name: 'Industry', value: 'Industry' },
					{ name: 'Language', value: 'Language' },
					{ name: 'Law', value: 'Law' },
					{ name: 'Location', value: 'Location' },
					{ name: 'Organization', value: 'Organization' },
					{ name: 'Person', value: 'Person' },
					{ name: 'Product', value: 'Product' },
					{ name: 'Work of Art', value: 'WorkOfArt' },
				],
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['searchEntities'] },
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 20,
				description: 'Maximum number of results to return.',
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
				description: 'Numeric ID of the entity to retrieve.',
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['getEntity'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: unknown;

				if (resource === 'knowledge') {
					if (operation === 'search') {
						const query = this.getNodeParameter('query', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'calaApi', {
							method: 'POST',
							url: `${BASE_URL}/v1/knowledge/search`,
							body: { input: query },
							json: true,
						});
					} else if (operation === 'query') {
						const query = this.getNodeParameter('query', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'calaApi', {
							method: 'POST',
							url: `${BASE_URL}/v1/knowledge/query`,
							body: { input: query },
							json: true,
						});
					} else if (operation === 'searchEntities') {
						const name = this.getNodeParameter('name', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;
						const entityTypes = this.getNodeParameter('entity_types', i) as string[];
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'calaApi', {
							method: 'GET',
							url: `${BASE_URL}/v1/entities`,
							qs: {
								name,
								limit,
								...(entityTypes.length ? { entity_types: entityTypes } : {}),
							},
							json: true,
						});
					} else if (operation === 'getEntity') {
						const entityId = this.getNodeParameter('entityId', i) as number;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'calaApi', {
							method: 'GET',
							url: `${BASE_URL}/v1/knowledge/entities/${entityId}`,
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
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: new NodeApiError(this.getNode(), error as JsonObject).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}
