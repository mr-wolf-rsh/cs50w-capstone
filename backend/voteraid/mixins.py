from rest_framework import status
from rest_framework.response import Response

from .utils import SUCCESS, FAILURE


class MultipleSerializerMixin:
    def get_serializer_class(self):
        try:
            return self.multiple_serializer_classes[self.action]
        except:
            return super(MultipleSerializerMixin, self).get_serializer_class()


class MultiplePermissionMixin:
    def get_permissions(self):
        try:
            return [perm() for perm in self.multiple_permission_classes[self.action]]
        except:
            return super(MultiplePermissionMixin, self).get_permissions()


class MultipleFilterMixin:
    def get_filter_query(self):
        from django.db.models import Q
        try:
            import functools
            query_params = self.request.query_params
            filtered_params = list(set(query_params.keys()) &
                                   set(self.multiple_filters.keys()))
            return functools.reduce(lambda result, key:
                                    result &
                                    functools.reduce(lambda x, y: x | y,
                                                     [Q(**{lookup: query_params[key]})
                                                      for lookup in self.multiple_filters[key]]),
                                    filtered_params,
                                    Q())
        except:
            return Q()


class ResponseMixin:
    def send_response(self,
                      message: str,
                      data: dict = {},
                      result: str = SUCCESS,
                      status_code: int = status.HTTP_200_OK):
        payload = dict(message=message,
                       data=data,
                       result=result)
        return Response(payload, status=status_code)

    def send_successful_response(self,
                                 data: dict,
                                 message: str = 'Data retrieval was successful',
                                 status_code: int = status.HTTP_200_OK):
        return self.send_response(message=message,
                                  data=data,
                                  result=SUCCESS,
                                  status_code=status_code)

    def send_failed_response(self,
                             message: str = 'Data retrieval has failed',
                             status_code: int = status.HTTP_400_BAD_REQUEST):
        return self.send_response(message=message,
                                  data=None,
                                  result=FAILURE,
                                  status_code=status_code)
