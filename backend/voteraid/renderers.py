from rest_framework.renderers import BrowsableAPIRenderer


class BrowsableAPIRendererWithoutForms(BrowsableAPIRenderer):
    def get_rendered_html_form(self, data, view, method, request):
        return None
