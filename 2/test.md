这是一个正文
这是一个正文

这是一个正文
![](1.jpg)
这是一个正文

1. 这是一个正文
![](1.jpg)
2. 这是一个正文

1. 这是一个正文
这是一个正文
![](1.jpg)
这是一个正文
2. 这是一个正文





这是一个正文  
这是一个正文  

这是一个正文  
![](1.jpg)  
这是一个正文  

1. 这是一个正文  
![](1.jpg)  
2. 这是一个正文  

1. 这是一个正文  
这是一个正文  
![](1.jpg)  
这是一个正文  
2. 这是一个正文  




```
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!--nacos服务发现-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
```



<pre><code>
    @GetMapping("/test1")
    public String test1(@RequestParam(required = false) String name) {
        if (name == null) name = "gykj";
        String result = restTemplate.getForObject("http://nacos-provider/hello?name=" + name, String.class);
        return result + "RestTemplate。";
    }
</code></pre>


```
String result = restTemplate.getForObject("http://nacos-provider/hello?name=" + name, String.class);
```




ffdsfsfda[f333](www.baidu.com)