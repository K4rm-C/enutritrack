import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as couchbase from 'couchbase';

@Injectable()
export class CouchbaseService implements OnModuleInit, OnModuleDestroy {
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;
  private collection: couchbase.Collection;

  async onModuleInit() {
    try {
      this.cluster = await couchbase.connect('couchbase://localhost', {
        username: 'Alfredo',
        password: 'alfredo124$$',
      });

      this.bucket = this.cluster.bucket('enutritrack');
      this.collection = this.bucket.defaultCollection();

      console.log('Couchbase connected successfully');
    } catch (error) {
      console.error('Couchbase connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.cluster.close();
  }

  async getDocument(key: string): Promise<any> {
    try {
      const result = await this.collection.get(key);
      return result.content;
    } catch (error) {
      if (error instanceof couchbase.DocumentNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async upsertDocument(key: string, document: any): Promise<void> {
    await this.collection.upsert(key, document);
  }

  async removeDocument(key: string): Promise<void> {
    await this.collection.remove(key);
  }

  async queryDocuments(query: string, parameters?: any): Promise<any[]> {
    try {
      const result: couchbase.QueryResult = await this.cluster.query(query, {
        parameters,
      });
      return result.rows;
    } catch (error) {
      console.error('Couchbase query error:', error);
      throw error;
    }
  }
}
