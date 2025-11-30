import { writeFileSync } from 'node:fs';
import Parser from "rss-parser";

/**
 * README.MD에 작성될 페이지 텍스트
 * @type {string}
 */
let text = `
<div align="center">
  
![header](https://capsule-render.vercel.app/api?type=venom&color=auto&height=300&section=header&text=Hello%Lima!&fontSize=90)
<a href="https://github.com/devxb/gitanimals">
<img src="https://render.gitanimals.org/farms/lima1016"/>
</a>
[![trophy](https://github-profile-trophy.vercel.app/?username=lima1016&theme=dracula)](https://github.com/lima1016/github-profile-trophy)

<br>   
  
</b> [![Typing SVG](https://readme-typing-svg.demolab.com/?lines=🌱+I’m+currently+learning!)](https://git.io/typing-svg) </b> <br>
<img src="https://img.shields.io/badge/Java-FF0000?style=flat-square&logo=Java&logoColor=white"/>
<img src="https://img.shields.io/badge/python-1313CB?style=flat-square&logo=Python&logoColor=white"/>
<img src="https://img.shields.io/badge/Apachekafka-231F20?style=flat-square&logo=apachekafka&logoColor=white"/>
<img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=Spring&logoColor=white"/>
<img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=flat-square&logo=SpringBoot&logoColor=white"/>
<img src="https://img.shields.io/badge/SpringCloud-6DB33F?style=flat-square&logo=springcloud&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white"/>
<img src="https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=MariaDB&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=MongoDB&logoColor=white"/>
<img src="https://img.shields.io/badge/Opensearch-C31B1B?style=flat-square&logo=Opensearch&logoColor=white"/>
<img src="https://img.shields.io/badge/Apache-D22128?style=flat-square&logo=Apache&logoColor=white"/>
<img src="https://img.shields.io/badge/ApacheTomcat-F8DC75?style=flat-square&logo=ApacheTomcat&logoColor=white"/>
<img src="https://img.shields.io/badge/ApacheMaven-C71A36?style=flat-square&logo=ApacheMaven&logoColor=white"/>
<img src="https://img.shields.io/badge/Gradle-02303A?style=flat-square&logo=Gradle&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-1F4BC6?style=flat-square&logo=Docker&logoColor=white"/>
<img src="https://img.shields.io/badge/Jenkins-E5145A?style=flat-square&logo=Jenkins&logoColor=white"/>
<img src="https://img.shields.io/badge/Nginx-21D262?style=flat-square&logo=Nginx&logoColor=white"/>
<img src="https://img.shields.io/badge/OAuth-EB5424?style=flat-square&logo=Auth0&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-58C5F3?style=flat-square&logo=jwt&logoColor=white"/>
<img src="https://img.shields.io/badge/IntelliJIDEA-000000?style=flat-square&logo=IntelliJIDEA&logoColor=white"/>
<img src="https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=Postman&logoColor=white"/>
<img src="https://img.shields.io/badge/Jira-0052CC?style=flat-square&logo=Jira&logoColor=white"/>

## 😎Lastest Blog Posts
</div>

`;

// rss-parser 생성
const parser = new Parser({
    headers: {
        Accept: 'application/rss+xml, application/xml, text/xml; q=0.1',
    }});

(async () => {

    // 피드 목록
    const feed = await parser.parseURL('https://lima1016.tistory.com/rss'); // 본인의 블로그 주소
    
    text += `<ul>`;
    
    // 최신 10개의 글의 제목과 링크를 가져온 후 text에 추가
    for (let i = 0; i < 10; i++) {
        const {title, link} = feed.items[i];
        console.log(`${i + 1}번째 게시물`);
        console.log(`추가될 제목: ${title}`);
        console.log(`추가될 링크: ${link}`);
        text += `✅ <a href='${link}' target='_blank'>${title}</a><br>`;
    }

    text += `</ul>`;
    
    // README.md 파일 생성
    writeFileSync('README.md', text, 'utf8', (e) => {
        console.log(e);
    })
    console.log('업데이트 완료');
})();

