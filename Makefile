HUGO_VERSION ?= 0.81.0
HUGO_PORT ?= 1313

.PHONY: all
all: build

.PHONY: build
build:
	hugo

.PHONY: bump-version-hugo
bump-version-hugo:
	@grep -lR "$(HUGO_VERSION)" . | \
		grep -v "^\./\.git/" | \
		grep -v "^\./archetypes/" | \
		grep -v "^\./assets/" | \
		grep -v "^\./content/" | \
		grep -v "^\./data/" | \
		grep -v "^\./i18n/" | \
		grep -v "^\./layouts/" | \
		grep -v "^\./node_modules/" | \
		grep -v "^\./themes/" | \
		grep -v "^\./public/" | \
		grep -v "^\./resources/" | \
		grep -v "\.swp\$$"

.PHONY: clean
clean:
	rm -rf public

.PHONY: run
run:
	hugo server -DEF --noHTTPCache --i18n-warnings --disableFastRender \
		--bind 0.0.0.0 --port $(HUGO_PORT) --baseUrl / --appendPort=false

##########
# Docker #
##########

DOCKER_IMAGE_TAG := $(HUGO_VERSION)-extended

.PHONY: docker-build
docker-build:
	@docker run --rm -it \
		-u $$(id -u $$USER) \
		-v "$${TMPDIR:-/tmp}":/tmp/ \
		-v "$$PWD":/site/ \
		ntrrg/hugo:$(DOCKER_IMAGE_TAG)

.PHONY: docker-run
docker-run:
	@docker run --rm -it \
		-e PORT=$(HUGO_PORT) \
		-p $(HUGO_PORT):$(HUGO_PORT) \
		-u $$(id -u $$USER) \
		-v "$${TMPDIR:-/tmp}":/tmp/ \
		-v "$$PWD":/site/ \
		ntrrg/hugo:$(DOCKER_IMAGE_TAG) server -DEF --noHTTPCache --i18n-warnings \
			--disableFastRender \
			--bind 0.0.0.0 --port $(HUGO_PORT) --baseUrl / --appendPort=false

.PHONY: docker-shell
docker-shell:
	@docker run --rm -it \
		-u $$(id -u $$USER) \
		-v "$${TMPDIR:-/tmp}":/tmp/ \
		-v "$$PWD":/site/ \
		--entrypoint sh \
		ntrrg/hugo:$(DOCKER_IMAGE_TAG)

########
# Make #
########

# Disable parallelism
.NOTPARALLEL:
