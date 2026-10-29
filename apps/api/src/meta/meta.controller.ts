import { Controller, Get } from '@nestjs/common';
import { SUPPORTED_CURRENCIES } from '../domain/currency';
import { EXPENSE_CATEGORIES } from '../domain/category';

/** Static reference data the web app needs for forms and formatting. */
@Controller()
export class MetaController {
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('meta/currencies')
  currencies() {
    return Object.values(SUPPORTED_CURRENCIES);
  }

  @Get('meta/categories')
  categories() {
    return EXPENSE_CATEGORIES;
  }
}
