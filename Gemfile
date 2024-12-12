# frozen_string_literal: true

source "https://rubygems.org"

gemspec

gem "html-proofer", "~> 5.0", group: :test

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.2.0", platforms: [:mingw, :x64_mingw, :mswin]

# Jekyll 관련 의존성 추가
gem "jekyll", "~> 4.3.0"
gem "jekyll-archives", "~> 2.2"      # 필요한 의존성
gem "jekyll-seo-tag", "~> 2.8"       # 필요한 의존성
gem "jekyll-redirect-from", "~> 0.16" # 필요한 의존성
