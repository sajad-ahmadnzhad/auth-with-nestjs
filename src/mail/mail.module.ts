import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            service: "gmail",
            port: 578,
            secure: false,
            logger: true,
            debug: true,
            auth: {
              user: config.get<string>("GMAIL_USER"),
              pass: config.get<string>("GMAIL_PASS"),
            },
            tls: { rejectUnauthorized: false },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [MailerModule]
})
export class MailModule {}
