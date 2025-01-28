from rest_framework.views import exception_handler


SUCCESS = 'SUCCESS'
FAILURE = 'FAILURE'


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if not response:
        response.data = {
            'message': response.data["detail"],
            'data': None,
            'result': FAILURE
        }

    return response
