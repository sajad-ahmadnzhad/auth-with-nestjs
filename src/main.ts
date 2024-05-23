import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>("PORT");
  const ALLOWED_ORIGINS: string[] =
    JSON.parse(configService.get<string>("ALLOWED_ORIGINS")) || [];

  //* Use static files
  const publicPath = `${process.cwd()}/public`;
  app.useStaticAssets(publicPath);

  //* Init swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Auth System")
    .setDescription("Auth system description")
    .setVersion("1.0")
    .addCookieAuth("accessToken", { type: "http" })
    .addTag("auth")
    .addTag("users")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("api", app, document);

  app.use(cookieParser());
  app.use(helmet());

  //* Config cors
  app.enableCors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  });

  await app.listen(PORT);
  logger.log(`Application running on port ${PORT}`);
}
bootstrap();
