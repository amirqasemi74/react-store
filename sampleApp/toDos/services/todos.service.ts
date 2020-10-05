import { Inject, Injectable } from "@react-store/core";
import ThemeService from "./theme.service";
@Injectable()
export default class ToDoService {
  constructor(@Inject(ThemeService) themeService: ThemeService) {}
}
