{% extends 'layout.swig' %}

{% block content %}
  <h1>{{ title }}</h1>
  <p>Welcome to {{ title }}</p>

  
	  <div>
	  	{{ blog.likes }}<br />
	    {{ blog.pages}}	  </div>
{% endblock %}
