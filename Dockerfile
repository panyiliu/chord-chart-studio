FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
COPY logo/ ./logo/
COPY packages/ ./packages/

RUN corepack enable && yarn install --immutable
RUN yarn workspace chord-chart-studio bundle

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx/chord-chart-studio.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/chord-chart-studio/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
