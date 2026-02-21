import pino from 'pino';

import { AppDataSource } from '@config';

import { City } from './entities/city.entity';
import { State } from './entities/state.entity';
import { Country } from './entities/country.entity';

import { CountryService } from './country.service';

import { CountryController } from './country.controller';
import { CountryRepository } from './country.repository';

const logger = pino({ name: 'country-module' });

const countryRepository = new CountryRepository(
  AppDataSource.getRepository(Country),
  AppDataSource.getRepository(State),
  AppDataSource.getRepository(City),
);

const countryService = new CountryService(countryRepository, logger);
const countryController = new CountryController(countryService);

export const countryRouter = countryController.router;
