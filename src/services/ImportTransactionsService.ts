import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  file: string
}

interface TransactionTemp {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {

    const filePath = path.join(uploadConfig.diretorio, file);

    try {

      const fileExists = await fs.promises.stat(filePath);

      if (fileExists) {
        const dados = await this.loadCSV(filePath);
        const transactionRepository = getCustomRepository(TransactionsRepository);
        const incomeTransactions: TransactionTemp[] = [];
        const outcomeTransactions: TransactionTemp[] = [];

        const balance = await transactionRepository.getBalance();

        dados.forEach((dado) => {
          const tempTransaction: TransactionTemp = {
            title: dado[0],
            type: dado[1],
            value: dado[2],
            category: dado[3]
          };

          if (tempTransaction.type === 'income') {
            incomeTransactions.push(tempTransaction);
            balance.total += tempTransaction.value;
          } else {
            outcomeTransactions.push(tempTransaction);
            balance.total -= tempTransaction.value;
          }
        });

        if (balance.total >= 0) {
          return await this.createAll(incomeTransactions, outcomeTransactions)
        }
      }

    } catch (err) {
      console.error(err)
    }

    return [];
  }

  private async createAll(incomeTransactions: TransactionTemp[], outcomeTransactions: TransactionTemp[]): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const allTransactions: Transaction[] = [];
    for (const each of incomeTransactions) {
      const transaction = await createTransaction.execute({ title: each.title, value: each.value, type: each.type, category: each.category });
      allTransactions.push(transaction)
    }

    for (const each of outcomeTransactions) {
      const transaction = await createTransaction.execute({ title: each.title, value: each.value, type: each.type, category: each.category });
      allTransactions.push(transaction)
    }

    return allTransactions;
  }

  private async loadCSV(filePath: string): Promise<any[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] | PromiseLike<any[]> = [];

    parseCSV.on('data', (line: any) => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }

}

export default ImportTransactionsService;
