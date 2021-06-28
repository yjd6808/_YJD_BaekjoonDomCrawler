var jsdom = require("jsdom");
var fileSystem = require("fs");
var readlineSync = require("readline-sync");
var backjoonCrawler = require("./baekjoon-crawler");
const { JSDOM } = jsdom;

/** ============================================================================
 * 프로그램 옵션 변수
 * ============================================================================ */

process.exitCode = 0;						// 정상적으로 종료되도록 우선 세팅한다.
const g_exportPath = './exports/'

/** ============================================================================
 * 이 프로그램의 메인 함수입니다.
 * ============================================================================ */
async function main() {
    try {
        var baekjoonDOM;

        if (process.argv.length >= 5) {
            console.log("사용법 : baekjoon-dom-crawler.exe <문제번호>");
            process.exit(-1);
        }

		if (process.argv.length == 4) {
			var startNumber = parseInt(process.argv[2]);
			var endNumber = parseInt(process.argv[3]);

			await startExportBaekjoonProblem(startNumber, endNumber);
			return;
        }

        if (process.argv.length == 3) {
            var problemNumber = parseInt(process.argv[2]);
            await startExportBaekjoonProblem(problemNumber, problemNumber);
			return;
        }

		console.log("< 메뉴 >");
		console.log("1. 특정 문제 추출");
		console.log("2. 범위 문제 추출");
		var selectString = await readlineAsync(">> ");
		var select = parseInt(selectString);

		if (select < 1 || select > 2) {
			await readlineAsync("아무키나 입력시 종료 됩니다.");
			process.exit(0);
		}

		await exceuteMenu(select);
    } catch (exception) {
        console.error(exception);
    }
}

/**
 * 선택한 메뉴에 해당하는 작업을 진행합니다.
 * @param {number} select - 선택한 메뉴 번호
 */
async function exceuteMenu(select) {
    if (select == 1) {
		var number = parseInt(await readlineAsync("문제 번호 입력 : "));
		startExportBaekjoonProblem(number, number);
    } else if (select == 2) {
		var startNumber = parseInt(await readlineAsync("시작 문제 번호 입력 : "));
		var endNumber = parseInt(await readlineAsync("마지막 문제 번호 입력 : "));

		startExportBaekjoonProblem(startNumber, endNumber);
    }
}

/**
 * startNumber 이상 endNumber 이하에 해당하는 문제를 추출합니다.
 * @param {number} startNumber 	- 추출할 처음 문제
 * @param {number} endNumber 	- 추출할 마지막 문제
 */
async function startExportBaekjoonProblem(startNumber, endNumber) {
    let problemCount = endNumber - startNumber + 1;
    let workingPromisesArray = [];
    const maxWorkingOnce = 32; // 한번에 처리할 최대 문제 수
    var workingOnce = maxWorkingOnce;

    if (problemCount <= 0) {
        return false;
    }

    // https://stackoverflow.com/questions/31424561/wait-until-all-promises-complete-even-if-some-rejected
    // 실패하더라도 Promise 중단 안되도록

    const reflectBaekjoonProblem = (p) =>
        p.then(
            (baekjoonDOM) => {
                console.log(baekjoonDOM.getProblemNumber() + " 작업완료");
                return { value:baekjoonDOM, status: 0 };
            },
            //error => ({error, status: -1}) 이렇게도 가능
            (error) => {
                console.log(error + " 작업실패");
                return { value:error, status: -1 };
            }
        );


	workingOnce = problemCount < maxWorkingOnce ? problemCount : maxWorkingOnce;

    for (let i = startNumber; i <= endNumber; ) {
        // 한번에 처리할 최대 작업 수만큼 배열에 담아준다.
        for (let j = 0; j < workingOnce; j++, i++) {
            workingPromisesArray.push(backjoonCrawler.getBackjoonProblemDOM(i));
        }

        // 배열에 담아준 작업을 모두 처리하기 까지 기다린다.
        await Promise.all(workingPromisesArray.map(reflectBaekjoonProblem)).then((results) => {
            // 성공적으로 얻어진 백준 문제만 JSON 형식으로 저장해준다.
            results.filter((x) => x.status != -1).forEach((x) => saveJungdoBaekjoonDomToJson(x.value));
        });

        // 완료된 Promise 배열을 비워준다.
        workingPromisesArray = [];

        // 남은 문제수에서 한번에 작업한 수만큼 빼준다.
        problemCount -= workingOnce;

        // 만약 한번에 처리할 수 있는 작업양보다 남은 문제 수가 적으면 적은 문제수만큼만 처리해주도록 한다.
        if (problemCount <= workingOnce) {
            workingOnce = problemCount;
        }
    }
}

/**
 * 백준돔의 데이터를 HTML 클립보드 형식의 템플릿에 저장합니다.
 */
function saveJungdoBaekjoonDomToJson(baekjoonDOM) {

	var exportFilePath = g_exportPath + baekjoonDOM.getProblemNumber() + '.json';

	if (!fileSystem.existsSync(g_exportPath)){
		fileSystem.mkdirSync(g_exportPath);
	}

	baekjoonDOM.parseAll();

	fileSystem.writeFile(
		exportFilePath, 							// 저장할 파일 경로
		JSON.stringify(baekjoonDOM).toString(),		// 저장할 데이터
		() => 										// 저장 완료되면 호출되는 함수
		{
			console.log(exportFilePath + ' 저장완료');
		}
	)
}

/**
 * 인자로 전달한 시간만큼 대기합니다.
 * @param {number} ms - 대기 시간 miliseconds
 */
function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

/**
 * 문자열을 입력받습니다.
 * @param {string} questionString - 질문 문자열
 * @returns
 */
function readlineAsync(questionString) {
    const readline = require("readline");

    const request = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        request.question(questionString, (answer) => {
            resolve(answer);
            request.close();
        });
    });
}

/** ============================================================================
 * 스크립트 시작
 * ============================================================================ */

console.log("프로그램이 시작되었습니다.");
main();



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
