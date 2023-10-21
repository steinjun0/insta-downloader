FROM node:18.15 AS builder
COPY ./insta-downloader-nextjs /root/src
WORKDIR /root/src/insta-downloader-nextjs

# puppeteer에 필요한 라이브러리 설치
RUN apt-get update && apt-get install -y \
libnss3 libatk-bridge2.0-0 libcups2 libdrm-dev libxkbcommon-x11-0 libxcomposite-dev libxdamage1 libgbm-dev libasound2 libxrandr2

# 크롬 설치를 위해서 npm uninstall && npm install puppeteer
# 크롬을 확실하게 설치하기 위해서 SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
RUN npm uninstall puppeteer && npm install puppeteer

FROM builder AS development

FROM builder AS production
RUN npm install --production
EXPOSE 3003
ENV NODE_ENV=production
ENV PORT=3003
RUN npm run build
CMD ["npm", "start"]

