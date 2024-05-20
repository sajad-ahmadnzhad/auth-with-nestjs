import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>("PORT");
  const ALLOWED_ORIGINS: string[] =
    JSON.parse(configService.get<string>("ALLOWED_ORIGINS")) || [];

  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  });
  await app.listen(PORT);
  logger.log(`Application running on port ${PORT}`);
}
bootstrap();
