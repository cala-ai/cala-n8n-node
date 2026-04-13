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

interface RelationshipItem {
	direction: 'outgoing' | 'incoming';
	relationshipType: string;
	limit?: number;
	offset?: number;
}

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
						description: 'Get the full profile of an entity by its UUID.',
					},
					{
						name: 'Get Entity Fields',
						value: 'getEntityFields',
						action: 'Get knowledge entity fields',
						description: 'Get available properties, relationships, and numerical observations for an entity.',
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

			// ── Knowledge › Get Entity / Get Entity Fields ──────────────────────
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. c6772802-bdbc-4778-91e9-cd3d27d008d5',
				description: 'UUID of the entity.',
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['getEntity', 'getEntityFields'] },
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: { resource: ['knowledge'], operation: ['getEntity'] },
				},
				options: [
					{
						displayName: 'Properties',
						name: 'properties',
						type: 'string',
						typeOptions: { multipleValues: true },
						default: [],
						placeholder: 'e.g. name',
						description:
							'List of property names to return (e.g. name, employee_count, founding_date). Run Get Entity Fields first to discover available properties.',
					},
					{
						displayName: 'Relationships',
						name: 'relationships',
						type: 'fixedCollection',
						typeOptions: { multipleValues: true },
						default: {},
						description:
							'Relationships to include in the response. Run Get Entity Fields first to discover available relationship types.',
						options: [
							{
								name: 'items',
								displayName: 'Relationship',
								values: [
									{
										displayName: 'Direction',
										name: 'direction',
										type: 'options',
										default: 'outgoing',
										options: [
											{ name: 'Outgoing', value: 'outgoing' },
											{ name: 'Incoming', value: 'incoming' },
										],
									},
									{
										displayName: 'Relationship Type',
										name: 'relationshipType',
										type: 'string',
										default: '',
										placeholder: 'e.g. IS_CEO_OF',
										description: 'Relationship type name as returned by Get Entity Fields.',
									},
									{
										displayName: 'Limit',
										name: 'limit',
										type: 'number',
										default: 10,
										typeOptions: { minValue: 1 },
										description: 'Maximum number of related entities to return.',
									},
									{
										displayName: 'Offset',
										name: 'offset',
										type: 'number',
										default: 0,
										typeOptions: { minValue: 0 },
										description: 'Number of related entities to skip (for pagination).',
									},
								],
							},
						],
					},
					{
						displayName: 'Numerical Observations',
						name: 'numericalObservations',
						type: 'string',
						default: '',
						placeholder: '{"FinancialMetric": ["uuid1", "uuid2"]}',
						description:
							'JSON object mapping observation type names to arrays of observation UUIDs. Run Get Entity Fields first to discover available types and UUIDs.',
					},
				],
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
						const entityId = this.getNodeParameter('entityId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							properties?: string[];
							relationships?: { items: RelationshipItem[] };
							numericalObservations?: string;
						};

						const body: Record<string, unknown> = {};

						if (additionalFields.properties?.length) {
							body.properties = additionalFields.properties;
						}

						const relationshipItems = additionalFields.relationships?.items ?? [];
						if (relationshipItems.length) {
							const outgoing: Record<string, { limit?: number; offset?: number }> = {};
							const incoming: Record<string, { limit?: number; offset?: number }> = {};
							for (const item of relationshipItems) {
								if (!item.relationshipType?.trim()) continue;
								const rel: { limit?: number; offset?: number } = {};
								if (item.limit != null) rel.limit = item.limit;
								if (item.offset != null) rel.offset = item.offset;
								(item.direction === 'outgoing' ? outgoing : incoming)[item.relationshipType] = rel;
							}
							const rel: Record<string, unknown> = {};
							if (Object.keys(outgoing).length) rel.outgoing = outgoing;
							if (Object.keys(incoming).length) rel.incoming = incoming;
							body.relationships = rel;
						}

						if (additionalFields.numericalObservations) {
							try {
								body.numerical_observations = JSON.parse(additionalFields.numericalObservations);
							} catch {
								throw new NodeOperationError(
									this.getNode(),
									'Numerical Observations must be a valid JSON object (e.g. {"FinancialMetric": ["uuid1"]})',
									{ itemIndex: i },
								);
							}
						}

						response = await this.helpers.httpRequestWithAuthentication.call(this, 'calaApi', {
							method: 'POST',
							url: `${BASE_URL}/v1/entities/${entityId}`,
							body,
							json: true,
						});
					} else if (operation === 'getEntityFields') {
						const entityId = this.getNodeParameter('entityId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'calaApi', {
							method: 'GET',
							url: `${BASE_URL}/v1/entities/${entityId}/introspection`,
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
				if (error instanceof NodeOperationError) throw error;
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
