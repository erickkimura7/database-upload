import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

// import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const repo = getCustomRepository(TransactionsRepository);

  const balance = await repo.getBalance();
  const transactions = await repo.find();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const service = new CreateTransactionService();
  const transaction = await service.execute(request.body);

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const service = new DeleteTransactionService();
  await service.execute(request.params.id);

  return response.status(204).send();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const service = new ImportTransactionsService();

  const transactions = await service.execute({ file: request.file.filename });

  return response.json(transactions);
});

export default transactionsRouter;
