import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactionToRemove = await transactionsRepository.findOne({
      id: id,
    });

    if (!transactionToRemove) {
      throw new AppError('Transaction id not found!');
    }

    await transactionsRepository.remove(transactionToRemove);
    return;
  }
}

export default DeleteTransactionService;
