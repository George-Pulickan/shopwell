# Shop Well prototype — static site served by nginx
# Build:  docker build -t shopwell .
# Run:    docker run --rm -p 8080:80 shopwell
# Open:   http://localhost:8080

FROM nginx:1.27-alpine

# The whole prototype is one self-contained file (HTML + CSS + JS),
# so the image stays tiny (~50 MB) and needs no build step.
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80

# Lets Docker (and any orchestrator) confirm the site is actually serving
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
