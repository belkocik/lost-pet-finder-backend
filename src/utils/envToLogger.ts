export const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:dd-mm-yyyy hh:mm:ss TT',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
};
