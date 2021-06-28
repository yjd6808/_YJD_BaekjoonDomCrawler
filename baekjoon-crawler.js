var httpRequester = require("./http-requester");
var fileSystem = require("fs");
var jsdom = require("jsdom");
var jquery = require("jquery");
const { OutgoingMessage } = require("http");
const { JSDOM } = jsdom;

/**
 * 날짜를 포맷형식으로 가져오는 함수
 * @param {string} f - 포맷 문자열
 * @returns - 날짜 문자열
 * @reference - https://stove99.tistory.com/46
 */
Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case "yyyy":
                return d.getFullYear();
            case "yy":
                return (d.getFullYear() % 1000).zf(2);
            case "MM":
                return (d.getMonth() + 1).zf(2);
            case "dd":
                return d.getDate().zf(2);
            case "E":
                return weekName[d.getDay()];
            case "HH":
                return d.getHours().zf(2);
            case "hh":
                return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm":
                return d.getMinutes().zf(2);
            case "ss":
                return d.getSeconds().zf(2);
            case "a/p":
                return d.getHours() < 12 ? "오전" : "오후";
            default:
                return $1;
        }
    });
};

String.prototype.string = function (len) {
    var s = "",
        i = 0;
    while (i++ < len) {
        s += this;
    }
    return s;
};
String.prototype.zf = function (len) {
    return "0".string(len - this.length) + this;
};
Number.prototype.zf = function (len) {
    return this.toString().zf(len);
};

class BaekjoonProblemDOM {
    _dom;                               // 해당 문제의 웹페이지의 DOM
    _$;                                 // 해당 문제의 웹페이지의 DOM 기반의 Jquery
    _document;                          // 해당 문제의 웹페이지의 Document
    _number;                            // 문제번호
    _title;                             // 문제 이름
    _timeLimit;                         // 시간 제한(초)
    _memoryLimit;                       // 메모리 제한(MB)
    _submitPeopleCount;                 // 제출자 수
    _answerPeopleCount;                 // 정답자 수
    _correctAnswerRate;                 // 정답률
    _problemDescriptionParagraphsArray; // 문제 설명
    _problemDescriptionTagsArray;       // 문제 설명 (HTML 형식)
    _inputDescriptionParagraphsArray;   // 입력 설명
    _outputDescriptionParagraphsArray;  // 출력 설명
    _samples;                           // 입, 출력 예시
    _stasticsDateTick;                  // 통계 날짜
    _hintDescriptionParagraphsArray;    // 힌트

    constructor(dom, number) {
        const { window } = dom;
        const { document } = dom.window;

        this._dom = dom;
        this._number = number;
        this._document = document;
        this._$ = require("jquery")(window);

        this._title = "";
        this._timeLimit = 0;
        this._memoryLimit = 0;
        this._submitPeopleCount = 0;
        this._answerPeopleCount = 0;
        this._correctAnswerRate = 0.0;
        this._problemDescriptionParagraphsArray = [];
        this._problemDescriptionTagsArray = [];
        this._inputDescriptionParagraphsArray = [];
        this._outputDescriptionParagraphsArray = [];
        this._samples = [];
        this._hintDescriptionParagraphsArray = [];
        this._stasticsDateTick = Date.now();
    }

    /* ===============================================================
     * public
     * =============================================================== */
    getProblemNumber() {
        return this._number;
    }

    getProblemTitle() {
        return this._title;
    }

    getTimeLimit() {
        return this._timeLimit;
    }

    getMemoryLimit() {
        return this._memoryLimit;
    }

    getSubmitPeopleCount() {
        return this._submitPeopleCount;
    }

    getSubmitPeopleCount() {
        return this._submitPeopleCount;
    }

    getAnswerPeopleCount() {
        return this._answerPeopleCount;
    }

    getCorrectAnswerRate() {
        return this._correctAnswerRate;
    }

    getProblemDescriptionParagraphsArray() {
        return this._problemDescriptionParagraphsArray;
    }

    getProblemDescriptionTagsArray() {
        return this._problemDescriptionTagsArray;
    }

    getInputDescriptionParagraphsArray() {
        return this._inputDescriptionParagraphsArray;
    }

    getOutputDescriptionParagraphsArray() {
        return this._outputDescriptionParagraphsArray;
    }

    getInputOutputSamples() {
        return this._samples;
    }

    getStasticsDateTick() {
        return this._stasticsDateTick;
    }

    getStasticsDateString() {
        return new Date().format("yyyy년 MM월 dd일 a/p hh시 mm분 ss초");
    }

    parseAll() {
        this.parseProblemTitle();
        this.parseProblemInfo();
        this.parseProblemDescription();
        this.parseProblemInputDescription();
        this.parseProblemOutputDescription();
        this.parseProblemInputOutputSamples();
        this.parseProblemHint();

        return this;
    }

    printInfo() {
        console.log("===============================");
        console.log("문제 번호 : " + this._number);
        console.log("===============================");
        console.log("문제 이름 : " + this._title);
        console.log("===============================");
        console.log("시간 제한 : " + this._timeLimit);
        console.log("메모리 제한 : " + this._memoryLimit);
        console.log("제출 인원 : " + this._submitPeopleCount);
        console.log("정답 인원 : " + this._answerPeopleCount);
        console.log("정답율 : " + this._correctAnswerRate);
        console.log("===============================");
        console.log("통계날짜 : " + this._stasticsDateTick);
        console.log("통계날짜 : " + this.getStasticsDateString());
        console.log("===============================");
        console.log("문제");

        for (let i = 0; i < this._problemDescriptionParagraphsArray.length; i++) {
            console.log(this._problemDescriptionParagraphsArray[i].paragraph);
        }

        console.log("문제 HTML");

        for (let i = 0; i < this._problemDescriptionTagsArray.length; i++) {
            console.log(this._problemDescriptionTagsArray[i].tag);
        }

        console.log("===============================");
        console.log("입력 ");

		for (let i = 0; i < this._inputDescriptionParagraphsArray.length; i++) {
            console.log(this._inputDescriptionParagraphsArray[i].paragraph);
        }
        console.log("===============================");
        console.log("출력 ");

		for (let i = 0; i < this._outputDescriptionParagraphsArray.length; i++) {
            console.log(this._outputDescriptionParagraphsArray[i].paragraph);
        }
        console.log("===============================");
        console.log("입출력 예시");
        for (let i = 0; i < this._samples.length; i++) {
            console.log("[입력 예시 " + i + "]");
            console.log(this._samples[i].inputSample + "\n");

            console.log("[출력 예시 " + i + "]");
            console.log(this._samples[i].outputSample + "\n");
        }
        console.log("===============================");
        console.log("힌트");
		for (let i = 0; i < this._hintDescriptionParagraphsArray.length; i++) {
            console.log(this._hintDescriptionParagraphsArray[i].paragraph);
        }
        console.log("===============================");
    }

    parseProblemTitle() {
        try {
            this._title = this._$("#problem_title").text();
        } catch (exception) {
            console.error("parseProblemInfo Failed" + "\n" + exception);
        }

        return this;
    }

    parseProblemInfo() {
        try {
            var problemInfoNodes = this._$("#problem-info tbody tr").children();
            this._timeLimit = parseInt(problemInfoNodes.get(0).innerHTML.replace(/\D/g, ""));
            this._memoryLimit = parseInt(problemInfoNodes.get(1).innerHTML.replace(/\D/g, ""));
            this._submitPeopleCount = parseInt(problemInfoNodes.get(2).innerHTML.replace(/\D/g, ""));
            this._answerPeopleCount = parseInt(problemInfoNodes.get(3).innerHTML.replace(/\D/g, ""));
            this._correctAnswerRate = parseFloat(problemInfoNodes.get(5).innerHTML.replace("%", ""));
        } catch (exception) {
            console.error("parseProblemInfo Failed" + "\n" + exception);
        }

        return this;
    }

    parseProblemDescription() {
        try {
            var problemDescriptionNode = this._$("#problem_description");
            var problemDescriptionChildrenNodes = problemDescriptionNode.children();

            problemDescriptionChildrenNodes.each((index, element) => {
                var paragraphText = (this._$(element).text() + "").trim();

                if (paragraphText.length > 0) {
					this._problemDescriptionParagraphsArray.push({
						paragraph : paragraphText
					});
                }

				var node = this._$(element); 
				if (node.children().length > 0) {
					var child = node.children();

					if (child.prop("tagName").toLowerCase() == "img") {
						var originalSrc = child.attr('src');
						if (!originalSrc.startsWith('http')) {
							child.attr('src', 'https://www.acmicpc.net' + originalSrc);
						}
					}
				}

                this._problemDescriptionTagsArray.push({
                    tag: node.html(),
                });
            });
        } catch (exception) {
            console.error("parseProblemDescription Failed" + "\n" + exception);
        }

        return this;
    }

    parseProblemInputDescription() {
        try {
            var problemInputNode = this._$("#problem_input");
            var problemInputChildrenNodes = problemInputNode.children();

            problemInputChildrenNodes.each((index, element) => {
                var paragraphText = (this._$(element).text() + "").trim();

                if (paragraphText.length > 0) {
					this._inputDescriptionParagraphsArray.push({
						paragraph : paragraphText
					});
                }
            });
        } catch (exception) {
            console.error("parseProblemInputDescription Failed" + "\n" + exception);
        }

        return this;
    }

    parseProblemOutputDescription() {
        try {
            var problemOutputNode = this._$("#problem_output");
            var problemOutputChildrenNodes = problemOutputNode.children();

            problemOutputChildrenNodes.each((index, element) => {
                var paragraphText = (this._$(element).text() + "").trim();

                if (paragraphText.length > 0) {
                    this._outputDescriptionParagraphsArray.push({
						paragraph : paragraphText
					});
                }
            });
        } catch (exception) {
            console.error("parseProblemOutputDescription Failed" + "\n" + exception);
        }

        return this;
    }

    parseProblemInputOutputSamples() {
        this._samples = [];

        /*
		 * ===================================================================
		 *	백준 입출력 예시의 경우 아래의 DOM 구조를 가지고 있다.
		 *	이를 파싱하여 배열에 담아주는 로직을 사용했다.
		 * ===================================================================
		 *  ◈ 입력이 없더라도 구조는 그대로 인것을 확인했다.
		 * * ===================================================================

        <div class="col-md-12">
            <div class="row">
                <div class="col-md-6">
                    <section id="sampleinput1">
                        <div class="headline">
                            <h2>
                                예제 입력 1
                                <button type="button" class="btn btn-link copy-button" style="padding: 0px;" data-clipboard-target="#sample-input-1">
                                    복사
                                </button>
                            </h2>
                        </div>
                        <pre class="sampledata" id="sample-input-1">
                            11 1 4 3 5 0 6 5 7 3 8 5 9 6 10 8 11 8 12 2 13 12 14
                        </pre>
                    </section>
                </div>
                <div class="col-md-6">
                    <section id="sampleoutput1">
                        <div class="headline">
                            <h2>
                                예제 출력 1
                                <button type="button" class="btn btn-link copy-button" style="padding: 0px;" data-clipboard-target="#sample-output-1">
                                    복사
                                </button>
                            </h2>
                        </div>
                        <pre class="sampledata" id="sample-output-1">
                            4
                        </pre>
                    </section>
       ^         </div>
            </div>
        </div>;
		*/
        try {
            var sampleNodes = this._$("section .sampledata");
            for (let i = 0; i < sampleNodes.length; i += 2) {
                var inputSampleNode = this._$(sampleNodes.get(i));
                var outputSampleNode = this._$(sampleNodes.get(i + 1));

                this._samples.push({
                    inputSample: inputSampleNode.text(),
                    outputSample: outputSampleNode.text(),
                });
            }
        } catch (exception) {
            console.error("parseProblemInputOutputSamples Failed" + "\n" + exception);
        }
        return this;
    }

    parseProblemHint() {
        try {
            var problemHintNode = this._$("#problem_hint");
            var problemHintChildrenNodes = problemHintNode.children();

            problemHintChildrenNodes.each((index, element) => {
                var paragraphText = (this._$(element).text() + "").trim();

                if (paragraphText.length > 0) {
                    this._hintDescriptionParagraphsArray.push({
						paragraph : paragraphText
					});
                } 
            });
        } catch (exception) {
            console.error("parseProblemHint Failed" + "\n" + exception);
        }
        return this;
    }
}

/**
 * @param {Integer} problemNumber - 백준 문제 번호
 * @returns 백준 문제 웹페이지의 DOM 객체
 */
async function getBackjoonProblemDOM(problemNumber) {
    const problemUrl = "https://www.acmicpc.net/problem/" + problemNumber;
    var baekjoonProblemDomOrError = await httpRequester.downloadWebDOMAsync(problemUrl);

    if (! (baekjoonProblemDomOrError instanceof JSDOM)) {
        return { number: problemNumber, error : baekjoonProblemDomOrError };
    }

    return new BaekjoonProblemDOM(baekjoonProblemDomOrError, problemNumber);
}

module.exports = {
    BaekjoonProblemDOM,
    getBackjoonProblemDOM
};
