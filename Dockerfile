# Shop Well prototype — static site served by nginx
# Build:  docker build -t shopwell .
# Run:    docker run --rm -p 8080:80 shopwell
# Open:   http://localhost:8080

FROM nginx:1.27-alpine

# One HTML file (HTML + CSS + JS) plus the produce photos —
# still no build step, and the image stays small.
COPY index.html /usr/share/nginx/html/index.html
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80

# Lets Docker (and any orchestrator) confirm the site is actually serving
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
