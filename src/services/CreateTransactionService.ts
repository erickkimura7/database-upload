import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total - value < 0) {
      console.log(`App error ${total - value}`)
      throw new AppError('Valor não pode ser inserido, por causa da contabilidade.', 400);
    }

    let categoryEntity = await categoryRepository.findOne({ title: category });

    if (!categoryEntity) {
      categoryEntity = categoryRepository.create({ title: category });
      categoryEntity = await categoryRepository.save(categoryEntity);
    }

    const transactionEntity = transactionRepository.create({ title, value, type, category_id: categoryEntity.id });

    transactionEntity.category = categoryEntity;
    await transactionRepository.save(transactionEntity);

    return transactionEntity;
  }
}

export default CreateTransactionService;
