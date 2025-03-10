document.addEventListener("DOMContentLoaded", function(){
    const searchButton = document.getElementById("searchBtn");
    const usernameInput = document.getElementById("userInput");
    const statsContainer = document.querySelector(".statsContainer");
    const easyProgressCircle = document.querySelector(".easyProgress");
    const mediumProgressCircle = document.querySelector(".mediumProgress");
    const hardProgressCircle = document.querySelector(".hardProgress");
    const easyLabel = document.getElementById("easyLabel");
    const mediumLabel = document.getElementById("mediumLabel");
    const hardLabel = document.getElementById("hardLabel");
    const cardStatsContainer = document.querySelector(".statsCards");



    //returns true or false based on regular expression
    function validateUsername(username){
        if(username.trim() === ""){
            alert('Please enter the username.');
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert('Invalid username.')
        }
        return isMatching;
    }


    async function fetchUserDetails(username){

        try{
            searchButton.textContent = 'Searching...';
            searchButton.disabled = true;

            // proxy url
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'

            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql =JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n     acSubmissionNum {\n     difficulty\n        count\n        submissions\n      }\n        totalSubmissionNum {\n        difficulty\n      count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: {"username": `${username}`}
            });
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            if(!response.ok){
                throw new Error('Unable to fetch the user details.')
            }
            const parsedData = await response.json();
            console.log('Logging data: ', parsedData);

            displayUserData(parsedData);
        }
        catch(error){
            statsContainer.innerHTML = `<p>No data found!`
        }
        finally{
            searchButton.textContent = 'Search';
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }


    function displayUserData(parsedData){
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const totalSovedQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const totalSovedEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const totalSovedMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const totalSovedHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(totalSovedEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(totalSovedMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(totalSovedHardQues, totalHardQues, hardLabel, hardProgressCircle);


        const cardsData = [
            {label: "Overall Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
        ];

        console.log('Card Data: ', cardsData)

        cardStatsContainer.innerHTML = cardsData.map(
            data => 
                `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                </div>`
        ).join("")

    }


    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        console.log("logging username: ", username);
        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    })

    
})