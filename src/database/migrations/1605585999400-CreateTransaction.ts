import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTransaction1605585999400 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(new Table({
      name: 'categories',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()'
        },
        {
          name: 'title',
          type: 'varchar',
          isNullable: false
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()'
        },
      ]
    }));

    await queryRunner.createTable(new Table({
      name: 'transactions',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()'
        },
        {
          name: 'title',
          type: 'varchar',
          isNullable: false
        },
        {
          name: 'value',
          type: 'decimal',
          isNullable: false
        },
        {
          name: 'type',
          type: 'varchar',
          enum: ['income', 'outcome']
        },
        {
          name: 'category_id',
          type: 'uuid',
          isNullable: true
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()'
        },

      ]
    }));

    await queryRunner.createForeignKey('transactions', new TableForeignKey({
      name: 'CategoryTransaction',
      columnNames: ['category_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'categories',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropForeignKey('transactions', 'CategoryTransaction');

    await queryRunner.dropTable('transactions');

    await queryRunner.dropTable('categories');
  }
}
