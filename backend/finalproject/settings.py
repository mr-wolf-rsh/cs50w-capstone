from os import environ
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ.get('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(int(environ.get('DEBUG', 0)))

ALLOWED_HOSTS = environ.get('DJANGO_ALLOWED_HOSTS', 'localhost').split(',')

ENGINES = {
    'sqlite3': 'django.db.backends.sqlite3',
    'postgresql': 'django.db.backends.postgresql'
}

PASSWORD_VALIDATORS = {
    'UserAttributeSimilarity': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    'MinimumLength': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    'CommonPassword': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    'NumericPassword': 'django.contrib.auth.password_validation.NumericPasswordValidator'
}

JQUERY_URL = False
USE_DJANGO_JQUERY = True


# Application definition
INSTALLED_APPS = [
    'voteraid',
    "whitenoise.runserver_nostatic",
    'corsheaders',
    'smart_selects',
    'rest_framework',
    'rest_framework.authtoken',
    'pgtrigger',
    'colorfield',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles'
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication'
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'voteraid.renderers.BrowsableAPIRendererWithoutForms',
    ],
    'EXCEPTION_HANDLER': 'voteraid.utils.custom_exception_handler',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.debug',
                'django.template.context_processors.request'
            ],
        },
    },
]

WSGI_APPLICATION = 'finalproject.wsgi.application'


# Database

DATABASES = {
    'default': {
        'ENGINE': ENGINES.get(environ.get('DB_ENGINE', 'sqlite3'), ENGINES['sqlite3']),
        'NAME': environ.get('DB_NAME', 'voteraid_db'),
        'USER': environ.get('DB_USER', 'user'),
        'PASSWORD': environ.get('DB_PASSWORD', 'password'),
        'HOST': environ.get('DB_HOST', 'localhost'),
        'PORT': environ.get('DB_PORT', 5432)
    }
}

AUTH_USER_MODEL = 'voteraid.User'

# Password validation

AUTH_PASSWORD_VALIDATORS = [{'NAME': PASSWORD_VALIDATORS.get(validator, PASSWORD_VALIDATORS['UserAttributeSimilarity'])} for validator in
                                environ.get('DJANGO_PASSWORD_VALIDATORS', 'UserAttributeSimilarity').split(',')]

# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'
#     }
# ]

# Password hashing

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.ScryptPasswordHasher',
]

# Internationalization

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

LOGIN_URL = '/auth/login'

APPEND_SLASH = True

STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

FILES_URL = 'files/'

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / FILES_URL / STATIC_URL

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / FILES_URL / MEDIA_URL

ROOT_URLCONF = 'finalproject.urls'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_CREDENTIALS = bool(int(environ.get('CORS_ALLOW_CREDENTIALS', 1)))
CORS_ORIGIN_WHITELIST = environ.get('CORS_ORIGIN_WHITELIST', 'http://localhost:3000').split(',')
CSRF_TRUSTED_ORIGINS = environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000').split(',')