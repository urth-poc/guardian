import { Schema } from '@entity/schema';
import { MongoRepository } from 'typeorm';
import { DocumentLoader, IDocumentFormat } from 'vc-modules';
import { ISchema } from 'interfaces';

/**
 * Schema Documents Loader.
 * Used for schema validation.
 */
export class ContextDocumentLoader extends DocumentLoader {
    private schemaRepository: MongoRepository<Schema>;
    private readonly context: string;

    constructor(
        schemaRepository: MongoRepository<Schema>,
        context: string  
    ) {
        super();
        this.context = context;
        this.schemaRepository = schemaRepository;
    }

    public async has(iri: string): Promise<boolean> {
        return iri && iri.startsWith(this.context);
    }

    public async get(iri: string): Promise<IDocumentFormat> {
        if (iri && iri.startsWith(this.context)) {
            return {
                documentUrl: iri,
                document: await this.getDocument(iri),
            };
        }
        throw new Error('IRI not found');
    }

    public async getDocument(iri: string): Promise<any> {
        const schema = await this.loadSchemaContext(iri);
        if (!schema) {
            throw new Error('Schema not found');
        }
        if (!schema.context) {
            throw new Error('context not found');
        }
        const document = JSON.parse(schema.context);
        return document;
    }

    private async loadSchemaContext(context: string): Promise<ISchema> {
        try {
            if (!context) {
                return null;
            }
            const schema = await this.schemaRepository.findOne({
                where: { contextURL: { $eq: context } }
            });
            return schema;
        }
        catch (error) {
            return null;
        }
    }
}