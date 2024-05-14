import { Module, ValidationPipe } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";
import { APP_PIPE} from "@nestjs/core";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      async useFactory(config: ConfigService) {
        const store = await redisStore({
          socket: {
            host: config.get<string>("REDIS_HOST"),
          },
        });

        return { store };
      },
    }),
  ],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
  ],
})
export class AppModule {}
