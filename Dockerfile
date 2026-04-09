FROM node:20

RUN adduser formsdb

USER formsdb

WORKDIR /home/formsdb

COPY --chown=formsdb:formsdb package*.json ./

RUN npm install

COPY --chown=formsdb:formsdb server.js ./

COPY --chown=formsdb:formsdb response.html ./

EXPOSE 3000

CMD ["sh", "-c", "\
  CMD_ARGS=''; \
  [ -n \"$PORT\" ] && CMD_ARGS=\"$CMD_ARGS --port=$PORT\"; \
  [ -n \"$RESPONSE_HTML_PATH\" ] && CMD_ARGS=\"$CMD_ARGS --response-html-path=$RESPONSE_HTML_PATH\"; \
  [ -n \"$MONGODB_URL\" ] && CMD_ARGS=\"$CMD_ARGS --mongodb-url=$MONGODB_URL\"; \
  [ -n \"$SCHEMA\" ] && CMD_ARGS=\"$CMD_ARGS --schema=$SCHEMA\"; \
  [ -n \"$MODEL_NAME\" ] && CMD_ARGS=\"$CMD_ARGS --model-name=$MODEL_NAME\"; \
  [ -n \"$HTTPS\" ] && CMD_ARGS=\"$CMD_ARGS --https\"; \
  [ -n \"$SSL_KEY_PATH\" ] && CMD_ARGS=\"$CMD_ARGS --ssl-key-path=$SSL_KEY_PATH\"; \
  [ -n \"$SSL_CERT_PATH\" ] && CMD_ARGS=\"$CMD_ARGS --ssl-cert-path=$SSL_CERT_PATH\"; \
  exec node server.js $CMD_ARGS \
"]