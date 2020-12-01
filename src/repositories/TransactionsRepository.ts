import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';


interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {

    const income: number = +await this.getSumType('income');
    const outcome: number = +await this.getSumType('outcome');

    return {
      income,
      outcome,
      total: income - outcome
    };
  }

  private async getSumType(type: 'income' | 'outcome'): Promise<number> {
    const { sum } = await this.createQueryBuilder('transaction')
      .select('SUM(transaction.value)', 'sum')
      .where('transaction.type = :type', { type })
      .getRawOne();

    return sum;
  }
}

export default TransactionsRepository;
