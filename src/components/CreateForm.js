import React, { useState, useEffect, useContext } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import { db, storage } from '../firebase';
import AboutForm from './common/AboutForm';
import LinksForm from './common/LinksForm';
import ProjectForm from './common/ProjectForm';
import ContactForm from './common/ContactForm';
import { useAuth } from '../contexts/AuthContext';
import ProjectColorPicker from './UserPages/ProjectColorPicker';
import PortfolioContent from './UserPages/PortfolioContent';
import { ThemeContext } from '../contexts/ThemeContext';

const CreateForm = () => {
	const [error, setError] = useState(false)
	const [showLinksSaveButton, setShowLinksSaveButton] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(null);
	const [formState, setFormState] = useState('');
	
	const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
	const [projectTitle, setProjectTitle] = useState('');
	const [projectText, setProjectText] = useState('');
	const [projectUrl, setProjectUrl] = useState('');
	const [projectImage, setProjectImage] = useState('');
	const [currentProjectIndex, setCurrentProjectIndex] = useState(null); 
	
	const [aboutTitle, setAboutTitle] = useState('');
	const [aboutText, setAboutText] = useState('');
	const [aboutUrl, setAboutUrl] = useState('');

	const [email, setEmail] = useState('');
	
	const [gitHubUrl, setGithubUrl] = useState('');
	const [linkedinUrl, setLinkedinUrl] = useState('');
	const [facebookUrl, setFacebookUrl] = useState('');
	
	const [portfolio, setPortfolio] = useState();
	const { currentUser } = useAuth();
	const { getTheme } = useContext(ThemeContext);
	const navigate = useNavigate();

	const getPortfolio = async () => {
		await db.collection('portfolios')
		.where('owner', '==', currentUser.uid)
		.get()
		.then((querySnapshot) => {
			if(querySnapshot.empty){
				const newPortfolio = {
					owner: currentUser.uid,
					about: [],
					projects: [],
					links: [],
					email: '',
				}
		
				db.collection("portfolios").add( newPortfolio )
				.then(docRef => {
					setPortfolio({
						id: docRef.id,
						owner: currentUser.uid,
						about: [],
						projects: [],
						links: [],
						email: '',
					});
					console.log('started new portfolio');
				})
				.catch((e) => {
					setError(e.message);
				})
			}
			querySnapshot.forEach((doc) => {
				setPortfolio({
					id: doc.id,
					...doc.data(),
				});
			})
		})
		.catch((e) => {
			setError(e.message);
		})
	}

	useEffect(() => {
		getPortfolio();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const unsubscribe = db.collection('portfolios')
		.where('owner', '==', currentUser.uid)
		.onSnapshot((snapshot) => {

			snapshot.forEach(doc => {
				setPortfolio({
					id: doc.id,
					...doc.data(),
				});
			});
		})
		return unsubscribe;
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [portfolio?.id])

	const addImageToStorage = (image) => {
		if(!image) {
			return;
		};
		const storageRef = storage.ref();

		//TODO We can add a folder for every owner in firebase and send to right owner folder `${owner.id}/${image.name}`
		const fileRef = storageRef.child(image.name);
		
		const uploadTask = fileRef.put(image);

		uploadTask.on('state_changed', taskSnapshot => {
			setUploadProgress(Math.round(
				(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100));
		});

		uploadTask.then(snapshot => {
			snapshot.ref.getDownloadURL().then(url => {
				setUploadedImageUrl(url);
				setProjectImage({
					name: image.name,
					size: image.size,
					type: image.type,
					path: snapshot.ref.fullPath,
					url,
				});
				setUploadProgress(null);
			});
		}).catch(error => {
			setError(error.message)
		});
	};

	const setPortfolioContent = (partToSet) => {
		db.collection('portfolios').doc(portfolio.id).get()
        .then((snapshot) => {
			let projects;
			let about;
			let data;
			let links;
			if(partToSet === 'projects'){
				data = {
					title: projectTitle,
					image: projectImage,
					projectUrl: projectUrl,
					text: projectText,
				}
				projects = snapshot.data().projects;
				if(currentProjectIndex || currentProjectIndex === 0){
					projects[currentProjectIndex] = data;
				}else{
					projects.push(data);
				}

				db.collection('portfolios').doc(portfolio.id).set({
					projects: projects,
				}, { merge: true })
				.then(() => {
					console.log('updated projects with success:', data)
					setCurrentProjectIndex(null);
				})
				.catch((e) => {
					setError(e.message);
				})
			}
			
			if (partToSet === 'about'){
				data = {
					title: aboutTitle,
					aboutUrl: aboutUrl,
					text: aboutText,
				}
				about = snapshot.data().about;
				if(currentProjectIndex || currentProjectIndex === 0) {
					about[currentProjectIndex] = data;
				}else{
					about.push(data);
				}

				db.collection('portfolios').doc(portfolio.id).set({
					about: about,
				}, { merge: true })
				.then(() => {
					console.log('updated projects with success:', data)
					setCurrentProjectIndex(null);
				})
				.catch((e) => {
					setError(e.message);
				})
			}

			if (partToSet === 'links') {
				data = {
					facebook: facebookUrl,
					linkedin: linkedinUrl,
					github: gitHubUrl,
				}

				links = snapshot.data().links;
				if(currentProjectIndex || currentProjectIndex === 0) {
					links[currentProjectIndex] = data;
				}else{
					links[0] = data;
				}

				db.collection('portfolios').doc(portfolio.id).set({
					links: links,
				}, { merge: true })
				.then(() => {
					console.log('updated projects with success:', data)
					setCurrentProjectIndex(null);
				})
				.catch((e) => {
					setError(e.message);
				})
			}

			if(partToSet === 'email') {
				db.collection('portfolios').doc(portfolio.id).set({
					email: email,
				}, { merge: true })
				.then(() => {
					console.log('updated projects with success:', email)
				})
				.catch((e) => {
					setError(e.message);
				})
			}

		}).catch((e) => {
			setError(e.message);
		})
	}

	const handleSaveOnClick = (e) => {
		if (e.target.innerHTML === 'Save Project') {
			if(projectText.length > 50) {
				return;
			}
			setProjectTitle('');
			setProjectImage('');
			setUploadedImageUrl(null);
			setProjectUrl('');
			setProjectText('');
			setPortfolioContent('projects');
		}

		if( e.target.innerHTML === 'Save Section') {
			setAboutTitle('');
			setAboutText('');
			setAboutUrl('');
			setPortfolioContent('about');
		}

		if( e.target.innerHTML === 'Save Links') {
			setGithubUrl('');
			setFacebookUrl('');
			setLinkedinUrl('');
			setShowLinksSaveButton(false);
			setPortfolioContent('links');
		}

		if( e.target.innerHTML === 'Save Email' ){
			setEmail('');
			setPortfolioContent('email');
		}

	}

	const handleImageChange = (e) => {
		addImageToStorage(e.target.files[0]);
	};

	const handleChangeOnClick = (part, object, index) => {
		if(part === 'project') {
			setProjectTitle(object.title);
			setUploadedImageUrl(object.image.url);
			setProjectImage(object.image.url);
			setProjectUrl(object.projectUrl);
			setProjectText(object.text);
			setCurrentProjectIndex(index);
		}

		if(part === 'about') {
			setAboutText(object.text);
			setAboutTitle(object.title);
			setAboutUrl(object.aboutUrl);
			setCurrentProjectIndex(index);
		}

		if(part === 'links') {
			setFacebookUrl(object.facebook);
			setLinkedinUrl(object.linkedin);
			setGithubUrl(object.github);
			setCurrentProjectIndex(index);
		}
	}

	const handleDelete = (part, index = 0) => {
		if(part === 'email'){
			db.collection("portfolios").doc(portfolio.id).update({
				[part]: ''
			})
			.then(function() {
				console.log("Document successfully deleted!");
			}).catch(function(error) {
				console.error("Error removing document: ", error);
			});
		} else{
			const updatedPart = portfolio[part];
			updatedPart.splice(index, 1);
			db.collection("portfolios").doc(portfolio.id).update({
				[part]: updatedPart 
			})
			.then(function() {
				console.log("Document successfully deleted!");
			}).catch(function(error) {
				console.error("Error removing document: ", error);
			});
		}
	}

	const handleShowPortfolioOnClick = () => {
		navigate(`/${currentUser?.displayName.replace(' ', '')}/`)
	}

	return ( 
		<>
			<div className="create-form">
				<Container className="form-container">
					{error && 
						(<Alert variant="danger">{error}</Alert>)
					}
					<Container onClick={() => setFormState('about')} className="pointer mt-5">
						<h2>Add About Text</h2>
						{
							formState === 'about' &&
								<AboutForm 
									title={aboutTitle}
									text={aboutText}
									url={aboutUrl}
									handleSaveOnClick={(e) => handleSaveOnClick(e)}
									handleTextChange={(e) => setAboutText(e.target.value)}
									handleTitleChange={(e) => setAboutTitle(e.target.value)}
									handleUrlChange={(e) => setAboutUrl(e.target.value)}
								/>
						}
					</Container>

					<Container onClick={() => setFormState('project')} className="pointer mt-5">
						<h2>Add Project</h2>
						{
							formState === 'project' && 
								<ProjectForm 
									title={projectTitle}
									text={projectText}
									url={projectUrl}
									image={projectImage}
									uploadProgress={uploadProgress}
									uploadedImageUrl={uploadedImageUrl}
									handleSaveOnClick={(e) => handleSaveOnClick(e)}
									handleImageChange={handleImageChange}
									handleTitleChange={(e) => setProjectTitle(e.target.value)}
									handleTextChange={(e) => setProjectText(e.target.value)}
									handleUrlChange={(e) => setProjectUrl(e.target.value)}
								/>
						}
					</Container>

					<Container onClick={() => setFormState('color')} className="pointer mt-5">
						<h2>Choose Color</h2>
						{
							formState === 'color' &&
								<ProjectColorPicker />
						}
					</Container>

					<Container onClick={() => setFormState('contact')} className="pointer mt-5">
						<h2>Add Contact</h2>	
						{
							formState === 'contact' &&
								<ContactForm
									email={email}
									handleEmailChange={(e) => setEmail(e.target.value)}
									handleSaveOnClick={(e) => handleSaveOnClick(e)}
								/>
						}
					</Container>

					<Container onClick={() => setFormState('links')} className="pointer mt-5">
						<h2>Add Links</h2>
						{
							formState === 'links' &&
								<LinksForm 
									showLinksSaveButton={showLinksSaveButton}
									facebookUrl={facebookUrl}
									gitHubUrl={gitHubUrl}
									linkedinUrl={linkedinUrl}
									handleGithubChange={(e) => {
										setGithubUrl(e.target.value) 
										setShowLinksSaveButton(true)}}
									handleLinkedinChange={(e) => {
										setLinkedinUrl(e.target.value)
										setShowLinksSaveButton(true)}}
									handleFacebookChange={(e) => {
										setFacebookUrl(e.target.value)
										setShowLinksSaveButton(true)}}
									handleSaveOnClick={(e) => handleSaveOnClick(e)}
								/>
						}
					</Container>
				</Container>

				<Container style={getTheme()} className="portfolio-container">
					<PortfolioContent
						formState={formState}
						portfolio={portfolio}
						handleDelete={handleDelete}
						handleChangeOnClick={handleChangeOnClick}
					/>
				</Container>

			</div>
			<Button className="button save-portfolio-button" onClick={handleShowPortfolioOnClick}>Show Portfolio</Button>
		</>
	 );
}
 
export default CreateForm;