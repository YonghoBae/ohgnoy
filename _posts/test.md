---
title: "Preview Mode for Static Generation"
excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus."
coverImage: "/assets/blog/preview/cover.jpg"
date: "2020-03-16T05:35:07.322Z"
author:
  name: Joe Haddad
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
---
## RDBMS Database 논리구조
- Database
	- Tables
		- Rows: 로우-실제 하나의 데이터셋
		- Columns: 컬럼(테이블에 미리 정의된 관리항목 구조)


## MySQL
- 컬럼 정의 및 데이터 유형
	- 문자형
		- CHAR: 고정길이
		- VARCHAR: 가변길이
			- 사용하지 않은 영역은 반환
			- 입력한 값만큼 사용
		- TEXT: 긴 문자
	- 숫자형
		- INT
		- TINYINT
	- 날짜형
		- DATETIME
		- DATE
		- TIME
	- 불린형
		- TINYINT(1)
 
## RDBMS의 중요목표
- 저장된 데이터에는 결함이 없어야하는 데이터 무결성 원칙을 보장되어야함
- 제약(Contraint Key)조건을 이용해 데이터 무결성을 유지
- 제약조건 EX) PrimaryKey, ForignKey, Default, Null체크, Unique키 등
- PrimaryKey는 모든 테이블에 반드시 하나 이상 존재

## 컬럼 키워드
- 게시글의 경우 PK(Primary Key)의 할당이 애매해서 자동 할당을 사용하기도 함.
- NN
	- Not Null
	- Null -> Data가 입력 안된 초기 상태, 공백문자와 다름
- UQ(Unique Index)
	- PK가 일반적으로 유니크하기 때문에 사용하지 않음
- B
	- Is binary column
- UN
	- Unsigned data type 
- ZF
	- Zero Fill
	- 숫자의 자릿수 고정 INT(4) 1이 입력된 경우 0001
- AI(Auto Incremental)
	- 자동 숫자 증가 데이터 생성
- PK 여러 개를 주면 PK 여러 개의 조합으로 고유한 값을 판단

## 주요 키
- PRIMARY KEY
	- 유일키(NonClusted Index Key)
- UNIQUE KEY
	- 유니크 키
- Foregin Key
	- 참조키
- INDEX KEY
	- 인덱스 키
- NON CLUSTED INDEX KEY
- CLUSTED INDEX

## Model
- 데이터의 구조를 프로그래밍 언어로 표현한 클래스
- 일반적으로 데이터를 저장하는 개별 테이블의 구조와 맵핑되는 모델 클래스 생성

## Model 유형
- Data Model
	- 데이터의 구조를 클래스의 속성으로 표현하고 데이터를 저장하는 것이 목적
- Domain Model
	- 실제 업무 기준으로 데이터 구조를 표현하며 테이블과는 구조가 다소 상이
- View Model
	- 뷰(화면)에서 데이터 바인딩을 위해 전문적으로 사용하는 뷰 전용 모델
- DTO Model
	- Data Transfer Object
	- 프로그래밍 계층 간 대량(복합) 데이터 전송을 위해 여러 모델을 하나의 전송모델로 재구성한 모델

## ORM 장점
- DB의 테이블과 맵핑되는 프로그램의 데이터 모델 클래스를 이용해 DB프로그램을 구현하는 방법
- CRUD작업을 위해 SQL 언어를 직접 사용하는것이 아닌 프로그램 언어를 이용해 CRUD 작업이 가능
- ORM 이용 시 RDBMS 종속적인 어플리케이션이 아닌 RDBMS를 변경해도 쉽게 대응이 가능
- 최소한의 SQL언어는 알아야 DB에 저장된 데이터에 대한 조작이나 고급 쿼리 작성 시 도움
- SQL을 몰라도 어플리케이션 개발언어를 이용해 데이터 처리업무를 개발(내부적으로 SQL로 자동변환 RDBMS에서 실행)
![[Pasted image 20240729150045.png]]

![[Pasted image 20240729150051.png]]


---

ORM
- Model First
	- code(모델)에서 테이블을 생성
- DB First
	- 테이블에서 모델을 생성



