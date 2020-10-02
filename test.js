const GoogleApi = require('./src/infra/google-api'); 
GoogleApi.allCourses()
.then(
    courses=>
    courses.forEach(
        course =>
        GoogleApi.courseWorksByCourse(course.id,3)
            .then(
                courseWorks=>
                courseWorks.forEach(
                    courseWork=>{
                        let  judge;
                        if(/(?<class>.*)\(python\)$/.test(courseWork.title)){
                            let path = courseWork.title.match(/(?<path>.*)\(python\)$/).groups.path;    
                            let Judge = new require("./src/infra/judge/pythonjudge");
                            judge = new Judge(path);
                        }else{
                            Judge = new require("./src/infra/judge/"+courseWork.title);
                            judge = new Judge();
                        }
                    GoogleApi.studentSubmissionsByCourseWork(course.id,courseWork.id)
                        .then(
                            studentSubmissions=>   
                            studentSubmissions.forEach(
                                studentSubmission=>{
                                    try {        
                                        judge.init(studentSubmission);                 
                                        judge.deliberate();
                                    } catch (error) {
                                        console.log(error.toString());                                      
                                    }     
                            })
                        )
                    })
        )
    ))
.then(()=>console.log("ciclo de varredura de submissões concluido"))
.catch((rej)=>console.log(rej));