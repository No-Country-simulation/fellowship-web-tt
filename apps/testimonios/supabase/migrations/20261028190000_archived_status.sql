-- Estado archived: el testimonio sale de la galería sin borrar los posts.
-- Va en su propio archivo: un valor nuevo de enum no se puede usar
-- en la misma transacción en la que se agrega.

alter type public.testimonial_status add value if not exists 'archived';
