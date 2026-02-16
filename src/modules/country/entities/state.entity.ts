import { City } from "./city.entity";
import { Country } from "./country.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from "typeorm";

@Entity("states")
export class State {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  name!: string;

  @ManyToOne(() => Country, country => country.states, { onDelete: "CASCADE" })
  country!: Country;

  @Column()
  countryId!: number;

  @OneToMany(() => City, city => city.state)
  cities!: City[];
}
