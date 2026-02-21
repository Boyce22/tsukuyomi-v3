import { Request, Response, NextFunction, Router } from 'express';
import { CountryService } from './country.service';
import { validateDto } from '@/shared/utils/validate-dto';
import { queryCountriesSchema } from './schemas/query-countries.schema';

export class CountryController {
  public router: Router;
  private countryService: CountryService;

  constructor(countryService: CountryService) {
    this.router = Router();
    this.countryService = countryService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getCountries.bind(this));
    this.router.get('/:iso', this.getCountryByIso.bind(this));
    this.router.get('/:countryId/states', this.getStates.bind(this));
    this.router.get('/states/:stateId/cities', this.getCities.bind(this));
  }

  async getCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryCountriesSchema, req.query);
      const result = await this.countryService.getCountries(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCountryByIso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const country = await this.countryService.getCountryByIso(req.params.iso);
      res.json(country);
    } catch (error) {
      next(error);
    }
  }

  async getStates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const countryId = Number(req.params.countryId);

      if (Number.isNaN(countryId)) {
        throw new Error('Country id must be a valid number');
      }

      const states = await this.countryService.getStatesByCountry(countryId);
      res.json(states);
    } catch (error) {
      next(error);
    }
  }

  async getCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stateId = Number(req.params.stateId);
      const cities = await this.countryService.getCitiesByState(stateId);
      res.json(cities);
    } catch (error) {
      next(error);
    }
  }
}
