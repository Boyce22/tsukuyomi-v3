import { Logger } from 'pino';
import { CountryRepository } from './country.repository';
import { QueryCountriesInput } from './schemas/query-countries.schema';
import { NotFoundError } from '@/shared/errors/app-error';

export class CountryService {
  constructor(
    private readonly countryRepository: CountryRepository,
    private readonly logger: Logger,
  ) {}

  async getCountries(query: QueryCountriesInput) {
    return this.countryRepository.findAllCursor(query);
  }

  async getCountryByIso(iso: string) {
    const country = await this.countryRepository.findByIso(iso);

    if (!country) {
      throw new NotFoundError('Country not found');
    }
    
    return country;
  }

  async getStatesByCountry(countryId: number) {
    return this.countryRepository.findStatesByCountryId(countryId);
  }

  async getCitiesByState(stateId: number) {
    return this.countryRepository.findCitiesByStateId(stateId);
  }
}