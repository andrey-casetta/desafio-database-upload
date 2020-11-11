import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository, In, TransactionRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);
    const readCSVStream = fs.createReadStream(filepath);
    const transactions: Request[] = [];
    const categories: string[] = [];

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existingCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existingTitles = existingCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitle = categories
      .filter(category => !existingTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitle.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);
    const finalCategories = [...newCategories, ...existingCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);
    return createdTransactions;
  }
}

export default ImportTransactionsService;
