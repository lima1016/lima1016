import { writeFileSync } from 'node:fs';
import Parser from "rss-parser";

/**
 * README.MD에 작성될 페이지 텍스트
 * @type {string}
 */
let text = `
<div align="center">

  ![header](https://capsule-render.vercel.app/api?type=cylinder&color=auto&height=100&section=header&text=Hello%Lima!&fontSize=70)
  [![trophy](https://github-profile-trophy.vercel.app/?username=lima1016&row=1)](https://github.com/lima1016/github-profile-trophy)

  ![lima1016's github stats](https://github-readme-stats.vercel.app/api?username=lima1016&show_icons=true&theme=synthwave&hide_border=true)
  <br>

</b> 🌱 I’m currently learning! </b> <br><br>
<img src="https://img.shields.io/badge/Java-FF0000?style=flat-square&logo=Java&logoColor=white"/>
<img src="https://img.shields.io/badge/Apachekafka-231F20?style=flat-square&logo=apachekafka&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=Spring&logoColor=white"/>
<img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/>
<img src="https://img.shields.io/badge/Gradle-02303A?style=flat-square&logo=Gradle&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white"/>
<img src="https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=MariaDB&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=MongoDB&logoColor=white"/>
<img src="https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=Postman&logoColor=white"/>
<img src="https://img.shields.io/badge/OAuth-EB5424?style=flat-square&logo=Auth0&logoColor=white"/> <br>
<img src="https://img.shields.io/badge/Json-000000?style=flat-square&logo=Json&logoColor=white"/>
<img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=flat-square&logo=SpringBoot&logoColor=white"/>
<img src="https://img.shields.io/badge/Apache-D22128?style=flat-square&logo=Apache&logoColor=white"/>
<img src="https://img.shields.io/badge/ApacheTomcat-F8DC75?style=flat-square&logo=ApacheTomcat&logoColor=white"/>
<img src="https://img.shields.io/badge/ApacheMaven-C71A36?style=flat-square&logo=ApacheMaven&logoColor=white"/>
<img src="https://img.shields.io/badge/IntelliJIDEA-000000?style=flat-square&logo=IntelliJIDEA&logoColor=white"/>
<img src="https://img.shields.io/badge/Jira-0052CC?style=flat-square&logo=Jira&logoColor=white"/>

<a href="https://github.com/devxb/gitanimals">
  <img src="https://render.gitanimals.org/farms/lima1016"/>
</a>

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
        text += `<li><a href='${link}' target='_blank'>${title}</a></li>`;
    }

    text += `</ul>`;
    
    // README.md 파일 생성
    writeFileSync('README.md', text, 'utf8', (e) => {
        console.log(e);
    })
    console.log('업데이트 완료');
})();