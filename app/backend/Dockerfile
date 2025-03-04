FROM node:20

# Install Redis
RUN apt-get update && apt-get install -y redis-server && apt-get clean

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Startup script
RUN echo '#!/bin/bash\nservice redis-server start\nnpm start' > /usr/src/app/start.sh
RUN chmod +x /usr/src/app/start.sh

EXPOSE 3000

# USER node
CMD ["/usr/src/app/start.sh"]
