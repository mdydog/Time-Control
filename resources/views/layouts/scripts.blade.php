<!-- Scripts -->
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<script src="{{ url('/') }}/js/jquery.inputmask.min.js"></script>
<script src="{{ url('/') }}/js/bootstrap.min.js"></script>
<script src="{{ url('/') }}/js/notify.min.js"></script>
<script src="{{ url('/') }}/js/util.js?v={{time()}}"></script>
<script src="{{ url('/') }}/js/datatables.min.js"></script>
<script src="{{ url('/') }}/js/jquery.csv.min.js"></script>

@if (Request::is('admin'))
<script src="{{ url('/') }}/js/xlsx.min.js"></script>
@endif

@if (!Request::is('profile'))
<!--date picker-->
<script src="{{url('/')}}/js/moment.min.js"></script>
<script src="{{url('/')}}/js/moment_locale_es.js"></script>
<script src="{{ url('/') }}/js/tempusdominus-bootstrap-4.min.js"></script>
@endif


<script>
    $(document).ready(function () {
        $("input[type='hour']").inputmask({"regex":"^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"});
    });
</script>
